import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Logger,
    Post,
    Res,
} from '@nestjs/common';
import { RefundDto } from 'src/common/types';
import { RefundsService } from 'src/services/refunds/refunds.service';

@Controller('refunds')
export class RefundsController {
    constructor(private refundService: RefundsService) { }

    @Post('/')
    async refundOrder(
        @Body()
        refundData: RefundDto,
        @Res() res,
    ) {
        try {
            Logger.log({
                message: 'Refund endpoint called',
                data: refundData,
            });
            const refund = await this.refundService.createOrUpdateRefund(refundData);
            return res.status(HttpStatus.OK).send(refund);
        } catch (err) {
            Logger.error(
                {
                    message: 'Error calling refund',
                    data: err,
                },
                err,
            );
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: err,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}