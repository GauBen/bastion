import { IsString, MinLength } from 'class-validator'

export class GetImageParams {
  @IsString()
  @MinLength(1)
  name!: string

  @IsString()
  @MinLength(1)
  accept!: string
}

export class GenerateImageParams {
  @IsString()
  @MinLength(1)
  name!: string

  @IsString()
  @MinLength(1)
  font!: string
}
