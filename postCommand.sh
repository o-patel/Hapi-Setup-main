# this file execute after git pull code will complete
# $1 you will get current path on server a
#!/bin/bash
echo "post command"
echo "path : $1"
cd "$1"
#sudo npm install
rm /var/www/html/demo/cmt/api/logs/log.txt
rm /var/www/html/demo/cmt/api/logs/error.txt
rm /var/www/html/demo/cmt/api/logs/output.txt
forever stop cmt
sudo kill `sudo lsof -t -i:8013`
forever start -c "npm run start:prod" -l "/var/www/html/demo/cmt/api/logs/log.txt" -e "/var/www/html/demo/cmt/api/logs/error.txt" -o "/var/www/html/demo/cmt/api/logs/output.txt" --uid "cmt" -a ./
