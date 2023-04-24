import { MovieQueryDto } from '../dto'
import { GetQueryDecorator } from '../../../common/decorators/get-query.decorator'

export const GetMovieQuery = GetQueryDecorator(MovieQueryDto)
