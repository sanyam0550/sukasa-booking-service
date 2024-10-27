// src/seat/seat.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  Param,
  NotFoundException,
  HttpStatus,
  HttpCode
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody
} from '@nestjs/swagger';
import { ReservationQueueService } from './services/reservation-queue.service';
import { ReserveSeatDto } from './dto/reserve-seat.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ReserveSeatCommand } from './commands/reserve.command';

@ApiTags('Seat') // Group under 'Seat' in Swagger UI
@ApiBearerAuth() // JWT Bearer token required
@Controller('seat')
@UseGuards(JwtAuthGuard)
export class SeatController {
  constructor(private readonly reservationQueueService: ReservationQueueService) {}

  @Post('reserve')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Reserve a seat in a flight' })
  @ApiBody({ type: ReserveSeatDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Reservation request queued' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized access' })
  async reserveSeat(@Body() reserveSeatDto: ReserveSeatDto, @Request() req) {
    const { seatNumber, flightId, passengerPhone, passengerName, passengerAge } = reserveSeatDto;
    const userId = req.user.email;

    const command = new ReserveSeatCommand(
      seatNumber,
      flightId,
      passengerPhone,
      passengerName,
      passengerAge,
      userId
    );

    const jobId = await this.reservationQueueService.enqueueReservation(command);

    return { message: 'Reservation request queued', jobId };
  }

  @Get('reservation-status/:jobId')
  @ApiOperation({ summary: 'Get the reservation status of a seat' })
  @ApiParam({ name: 'jobId', description: 'The ID of the reservation job', example: '12345' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reservation successful',
    schema: {
      example: {
        statusCode: 200,
        message: 'Reservation successful',
        result: {
          /* example data */
        }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Reservation failed',
    schema: {
      example: { statusCode: 400, message: 'Reservation failed', error: 'Some error message' }
    }
  })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Reservation is being processed',
    schema: { example: { statusCode: 202, message: 'Reservation is being processed' } }
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Reservation job not found' })
  async getReservationStatus(@Param('jobId') jobId: string) {
    const statusResult = await this.reservationQueueService.getReservationStatus(jobId);

    switch (statusResult.status) {
      case 'completed':
        return {
          statusCode: HttpStatus.OK,
          message: 'Reservation successful',
          result: statusResult.data
        };
      case 'failed':
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Reservation failed',
          error: statusResult.error
        };
      case 'pending':
        return { statusCode: HttpStatus.ACCEPTED, message: 'Reservation is being processed' };
      default:
        throw new NotFoundException('Reservation job not found');
    }
  }
}
