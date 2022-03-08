import {
  IsBoolean,
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
  @Matches(/^[a-z0-9._]+$/i, {
    message: ({ property }) =>
      `${property} must be made of letters, numbers, dots and underscores`,
  })
  name!: string

  @Length(1, 30)
  displayName!: string
}

export class UpdateNameDto {
  @Length(1, 30)
  displayName!: string
}

export class PromoteUserDto {
  @IsString()
  key!: string
}

export class FindUsersDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  displayName?: string

  @IsOptional()
  @IsBoolean()
  admin?: boolean
}
