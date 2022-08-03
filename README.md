#Archery Contest Backend

Architecture - https://www.mindmeister.com/map/2355617550?t=6BIg5PyPWI
Trello - https://trello.com/b/hDbViME0/archery-contest

##To make it work
create a "/config/dev.env" file with such content:
- PORT=3000 // it's ok
- SENDGRID_API_KEY='' // take it here https://app.sendgrid.com/
- MONGODB_URL='' // ex. mongodb://127.0.0.1:27017/api
- JWT_SECRET='' // any symbols