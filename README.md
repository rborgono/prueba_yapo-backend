# Test Yapo Backend

Instalar componentes:
```sh
npm install
```

Levantar servidor:
```sh
npm start
```

Error de nodemon: Internal watch failed: ENOSPC: System limit for number of file watchers reached, resolver con comando:
```sh
echo fs.inotify.max_user_watches=582222 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```
