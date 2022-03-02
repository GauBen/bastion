import {
  IsLowercase,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'

export class CreateUserDto {
  @Length(3, 20)
  @IsLowercase()
  @Matches(/^[a-z]/i, {
    message: ({ property }) => `${property} must start with a letter`,
  })
  @Matches(/^[a-z._]+$/i, {
    message: ({ property }) =>
      `${property} must be made of letters, dots and underscores`,
  })
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
