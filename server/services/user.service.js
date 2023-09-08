'use strict'
const Schmervice = require('schmervice')
const User = require('@models/user.model').schema
const errorHelper = require('@utilities/error-helper')
const helper = require('@utilities/helper')
const moment = require('moment')
const config = require('config')

module.exports = class UserService extends Schmervice.Service {
  async getUserById(id) {
    try {
    const user = await User.findById(id)
    return user
    } catch (err) {
    errorHelper.handleError(err)
    }
  }

  async getPermission(userId) {
    const aggQuery = [
      {
        $match: {
          usersIds: userId
        }
      },
      {
        $lookup: {
          from: 'role-masters',
          localField: 'roleId',
          foreignField: '_id',
          as: 'role',
        }
      },
      { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectsIds',
          foreignField: '_id',
          as: 'projects',
        }
      },
      { $unwind: { path: "$projects", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          project: "$projects.name",
          projectId: "$projects._id",
          permission: "$role.permissions"
        }
      }
    ]
    const role = await UserRoleModel.aggregate(aggQuery)
    return role
  }

  async getUserNameFromEmail(count) {
    try {
      const generatedUserName = `TSPL${helper.addLeadingZeros(count + 1, 3)}`
      return await this.checkUserName(generatedUserName,count + 1)
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }

  async checkUserName(userId,count) {
    try {
      const user = await User.findOne({
        isDeleted: false,
        userId: userId
      })
      if (user) {
        console.log('duplicate found for username', userId)
        const newUserName = `TSPL${helper.addLeadingZeros(count++, 3)}`
        return await this.checkUserName(newUserName,count)
      } else {
        console.log('no duplicate found for username: ', userId);
        return { userId }
      }
    } catch (e) {
      return errorHelper.handleError(e)
    }
  }

  async getAllUser(request){
    try {
      return await User.find({ isDeleted: false, isAccountVerified : true }).select('name')
    } catch (err) {
      errorHelper.handleError(err)
    }
  }

  async getMyAllUser(request) {
    try {
      const { query } = request;
      const findQuery = {}
      if(query.status){
        findQuery['isAccountVerified'] = query.status === 'ACTIVE' ? true : false
      }
      const countQuery = User.find(findQuery);
      const mongooseQuery = User.find(findQuery);

      if (query.search) {
        var likeQuery = [];
        var search = query.search.split(' ');
        const searchableFields = ['name'];
        searchableFields.forEach((field) => {
          search.forEach((se) => {
            likeQuery.push({
              [field]: {
                $regex: se,
                $options: 'i',
              },
            });
          });
        });
        mongooseQuery.or(likeQuery);
        countQuery.or(likeQuery);
      }
      const limit = query && query.limit ? query.limit : 10;
      let skip = 0;
      let page = 1;
      let hasMany = null;
      mongooseQuery.limit(limit);
      if (
        query.page !== undefined &&
        query.page !== '' &&
        query.page !== null
      ) {
        page = parseInt(query.page);
        skip = (parseInt(page) - 1) * parseInt(limit);
        mongooseQuery.skip(skip);
      }
      if(Object.hasOwnProperty.bind(query)('employeeCodeFilter')){
        if(query.employeeCodeFilter){
          mongooseQuery.sort({ createdAt: 1 })
        } else {
          mongooseQuery.sort({ createdAt: -1 });
        }
      } else {
        mongooseQuery.sort({ name: 1 });
      }


      const result = await mongooseQuery.lean();
      const totalCountResult = await countQuery.count();

      if (skip + result.length >= totalCountResult) {
        hasMany = false;
      } else {
        hasMany = true;
      }

      return {
        list: result,
        count: result.length,
        total: totalCountResult,
        hasMany: hasMany,
        from: skip + 1,
        to: skip + result.length,
      };
    } catch (error) {
      errorHelper.handleError(error);
    }
  }

  async setJoiningDay(){
    try{
      const users = await User.find()
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        user['joiningDate'] = user['createdAt']
        await user.save()
      }
    } catch (e) {
        errorHelper.handleError(e)
    }
  }
}
