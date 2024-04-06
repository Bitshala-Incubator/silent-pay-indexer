import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { ServiceStatus } from '@/common/enum';

describe('AppController', () => {
    let appController: AppController;

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [AppController],
            providers: [AppService],
        }).compile();

        appController = app.get<AppController>(AppController);
    });

    it(`should return "${ServiceStatus.HEALTHY}"`, () => {
        expect(appController.getHealth()).toBe(ServiceStatus.HEALTHY);
    });
});
