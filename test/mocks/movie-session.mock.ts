import { EXTRA_MOVIE_SESSION_TIME } from '../../src/movie-session/movie-session.constants'

export function initMovieSessionMocks(durationMovie1: number) {
  const successMockDataControlCase = [
    {
      name: '(success) - CONTROL CASE',
      startDate: new Date('July 1, 2022, 14:00:00'),
      duration: durationMovie1 + EXTRA_MOVIE_SESSION_TIME,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
  ]

  const failMockGapData = [
    {
      name: '(fail) - gap only 1 minute: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 1) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
    {
      name: '(fail) - gap only 60 minute: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 60) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
  ]

  const successMockGapData = [
    {
      name: '(success) - gap for 61 minutes: ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration + 61) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
  ]

  const failMockData = [
    {
      name: '(fail) - overlapping (exact both boundaries): ',
      startDate: successMockDataControlCase[0].startDate,
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
    {
      name: '(fail) - overlapping (full overlapping): ',
      startDate: new Date(successMockDataControlCase[0].startDate.getTime() + 1 * 60000),
      duration: successMockDataControlCase[0].duration - 2,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
    {
      name: '(fail) - overlapping (external both boundaries): ',
      startDate: new Date(successMockDataControlCase[0].startDate.getTime() - 1 * 60000),
      duration: successMockDataControlCase[0].duration + 2,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
    {
      name: '(fail) - overlapping (left boundary): ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() + (successMockDataControlCase[0].duration / 2) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
    {
      name: '(fail) - overlapping (right boundaries): ',
      startDate: new Date(
        successMockDataControlCase[0].startDate.getTime() - (successMockDataControlCase[0].duration / 2) * 60000,
      ),
      duration: successMockDataControlCase[0].duration,
      price: 50,
      priceFactors: {
        SEAT: 1,
        VIP: 1.5,
        LOVE: 2.25,
      },
    },
  ]

  return { successMockDataControlCase, failMockGapData, successMockGapData, failMockData }
}
