import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ConfigService } from '@nestjs/config';
import { LogLevel } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';

declare const module: any;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useWebSocketAdapter(new WsAdapter(app));

    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get<number>('app.port');

    const isVerbose = configService.get<boolean>('app.verbose') ?? false;
    const isDebug = configService.get<boolean>('app.debug') ?? false;

    const loggerLevels: LogLevel[] = ['error', 'warn', 'log'];

    if (isVerbose) loggerLevels.push('verbose');
    if (isDebug) loggerLevels.push('debug');

    app.useLogger(loggerLevels);

    await app.listen(port);

    if (module.hot) {
        module.hot.accept();
        module.hot.dispose(() => app.close());
    }
}
bootstrap();
