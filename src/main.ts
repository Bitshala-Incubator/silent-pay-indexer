import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get<number>('app.port');

    const isVerbose = configService.get<boolean>('app.verbose') ?? false;

    const loggerLevels: LogLevel[] = ['error', 'warn', 'log', 'debug'];

    if (isVerbose) {
        loggerLevels.push('verbose');
    }

    app.useLogger(loggerLevels);

    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
