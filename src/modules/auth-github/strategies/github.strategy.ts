import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-github2'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(config: ConfigService) {
    super({
      clientID: config.get<string>('GITHUB_CLIENT_ID'),
      clientSecret: config.get<string>('GITHUB_SECRET'),
      callbackURL:
        'https://modsen-cinema-pre-dev-a3-backend.vercel.app/api/v1/auth/github/redirect',
      scope: ['email', 'profile'],
    })
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    // eslint-disable-next-line @typescript-eslint/ban-types
    done: Function,
  ): Promise<any> {
    const { displayName, username, photos } = profile
    const [firstName, lastName] = displayName?.split(' ') || []

    const user = {
      firstName,
      lastName,
      username,
      avatar: photos[0].value,
      accessToken,
    }

    done(null, user)
  }
}
