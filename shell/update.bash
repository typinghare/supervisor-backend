
git reset --hard
git pull

npm i

npm run build

forever restart ./dist/main.js

forever list