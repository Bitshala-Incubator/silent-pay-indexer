import { INestApplication, Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import * as Docker from 'dockerode';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

async function startBitcoinD(): Promise<Docker.Container> {
    const logger = new Logger('Bitcoind');
    let container: Docker.Container;

    try {
        const docker = new Docker();
        const imageName = 'btcpayserver/bitcoin:24.0.1-1';

        const images = await docker.listImages();
        const imageExists = images.some(
            (image) => image.RepoTags && image.RepoTags.includes(imageName),
        );

        // Pull the image if it's not available
        if (!imageExists) {
            logger.log(`Image ${imageName} not found locally. Pulling...`);
            const stream = await docker.pull(imageName);
            await new Promise((resolve, reject) => {
                docker.modem.followProgress(stream, (err, output) =>
                    err ? reject(err) : resolve(output),
                ),
                    (event) => logger.log(event.status);
            });
        }

        // Create and start the container
        container = await docker.createContainer({
            Image: imageName,
            ExposedPorts: { '18443/tcp': {} }, // Expose the Bitcoin RPC and P2P ports
            HostConfig: {
                PortBindings: {
                    '18443/tcp': [{ HostPort: '18443' }],
                },
            },
            Env: [
                'BITCOIN_NETWORK=regtest',
                `BITCOIN_EXTRA_ARGS=server=1\n
                    rest=1\n
                    rpcbind=0.0.0.0:18443\n
                    rpcallowip=0.0.0.0/0\n
                    rpcuser=polaruser\n
                    rpcpassword=password\n
                    debug=1\n
                    logips=1\n
                    logtimemicros=1\n
                    blockmintxfee=0\n
                    deprecatedrpc=signrawtransaction\n
                    listenonion=0\n
                    fallbackfee=0.00001\n
                    txindex=1`,
            ],
        });

        logger.log('Starting bitcoind container...');
        await container.start();
        logger.log('bitcoind is now running inside Docker.');

        // Optionally, follow logs
        const logs = await container.logs({
            follow: true,
            stdout: true,
            stderr: true,
        });
        logs.on('data', (log) => {
            logger.log(log.toString());
        });

        return container;
    } catch (error) {
        logger.error('Error starting bitcoind container:', error);
        await container.remove({ v: true, force: true });
        throw new Error(error);
    }
}

async function setupTestApp(): Promise<INestApplication> {
    process.env.NODE_ENV = 'e2e';
    process.env.NODE_DIRNAME = join(__dirname, '..');

    const app = await NestFactory.create(AppModule);

    const configService = app.get<ConfigService>(ConfigService);
    const port = configService.get<number>('app.port');

    await app.listen(port);

    return app;
}

export async function initialiseDep() {
    const bitcoind = await startBitcoinD();
    const app = await setupTestApp();

    return async function shutdownDep() {
        await app.close();
        await bitcoind.stop();
        await bitcoind.remove({ v: true, force: true });
    };
}
