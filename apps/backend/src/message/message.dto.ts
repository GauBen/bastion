import { IsNumber, Length } from 'class-validator'

export class CreateMessageDto {
  @IsNumber()
  toId!: number

  @Length(1, 150)
  body!: string
}
