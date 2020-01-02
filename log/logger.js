const { format, transports, loggers } = require('winston');
const { combine, timestamp, colorize, printf, label } = format;
const myFormat = printf(info => {
    return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
});

loggers.add('database', {
    format: combine(
        label({ label: 'Database' }),
        timestamp()
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                myFormat
            )
        })
    ]
});

loggers.add('debug', {
    format: combine(
        label({ label: 'Development - Debug' }),
        timestamp()
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                myFormat
            )
        })
    ]
});

loggers.add('process', {
    format: combine(
        label({ label: 'Execution' }),
        timestamp()
    ),
    transports: [
        new transports.Console({
            format: combine(
                colorize(),
                myFormat
            )
        })
    ]
});

module.exports = {
    database: loggers.get('database'),
    debug: loggers.get('debug'),
    execution: loggers.get('process')
};