export class ReserveSeatCommand {
  constructor(
    public readonly seatNumber: string,
    public readonly flightId: string,
    public readonly passengerPhone: string,
    public readonly passengerName: string,
    public readonly passengerAge: number,
    public readonly userId: string
  ) {}
}
