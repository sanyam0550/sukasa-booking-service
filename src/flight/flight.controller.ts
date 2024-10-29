import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FlightService } from './flight.service';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFlightDto } from './dto/create-flight.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@ApiTags('Flight')
@ApiBearerAuth()
@Controller('flight')
export class FlightController {
  constructor(private readonly flightService: FlightService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  @ApiOperation({ summary: 'Add a new flight with seats' })
  @ApiResponse({ status: 201, description: 'Flight and seats successfully added' })
  @ApiResponse({ status: 400, description: 'Invalid flight details' })
  async addFlight(@Body() createFlightDto: CreateFlightDto) {
    return this.flightService.addFlight(createFlightDto);
  }
}
