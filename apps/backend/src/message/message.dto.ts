import { IsBoolean, IsNumber, Length } from 'class-validator'

export class CreateMessageDto {
  @IsNumber()
  toId!: number

  @IsBoolean()
  gif = false

  @Length(1, 150)
  body!: string
}
