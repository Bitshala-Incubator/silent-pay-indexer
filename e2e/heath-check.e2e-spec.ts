import { ApiHelper } from '@e2e/helpers/api.helper';
import { ServiceStatus } from '@/common/enum';

describe('Health check', () => {
    let apiHelper: ApiHelper;

    beforeAll(() => {
        apiHelper = new ApiHelper();
    });

    it('should check health of indexer', async () => {
        const { data, status } = await apiHelper.get(`/health`);

        expect(status).toBe(200);
        expect(data).toEqual(ServiceStatus.HEALTHY);
    });
});
