import { IsAlphanumeric, IsOptional, IsString, Length } from 'class-validator'

export class CreateUserDto {
  @IsAlphanumeric()
  @Length(3, 20)
  name!: string

  @Length(1, 30)
  displayName!: string
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  displayName?: string
}

export class PromoteUserDto {
  @IsString()
  key!: string
}
