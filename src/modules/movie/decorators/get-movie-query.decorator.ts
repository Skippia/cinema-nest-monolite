import { MovieQueryDto } from '../dto'
import { GetQueryDecorator } from 'src/common/decorators/get-query.decorator'

export const GetMovieQuery = GetQueryDecorator(MovieQueryDto)
