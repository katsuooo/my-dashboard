const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger_client = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [
    new DailyRotateFile({
      filename: 'logs_client/application-%DATE%.log', // 日付ごとにログを作成
      datePattern: 'YYYY-MM-DD',               // ログファイルの名前に日付を含める
      zippedArchive: true,                     // 古いログを圧縮して保存する
      maxSize: '20m',                          // ログファイルの最大サイズを20MBに設定
      maxFiles: '14d'                          // 14日分のログを保持、それ以上古いログは削除される
    })
  ]
});

module.exports = logger_client;
