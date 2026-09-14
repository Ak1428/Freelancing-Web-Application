set PATH=%PATH%;C:\Program Files\nodejs
rmdir /s /q node_modules
del /f /q package-lock.json
npm install
npm install next-auth @prisma/client pusher pusher-js bcryptjs
npm install -D prisma @types/bcryptjs
