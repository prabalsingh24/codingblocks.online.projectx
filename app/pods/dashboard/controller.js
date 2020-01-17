import Controller from '@ember/controller';
import { restartableTask } from 'ember-concurrency-decorators';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default class Dashboard extends Controller {
  @service api
  @service store
  @service player

  @alias('lastAccessedRun.topRunAttempt.progressPercent')
  progressPercent
  @alias('fetchWishlistCoursesTask.lastSuccessful.value')
  wishlist
  @alias('fetchAppliedJobsTask.lastSuccessful.value')
  appliedJobs
  @alias('fetchCoursesTask.lastSuccessful.value')
  runs

  @computed('fetchAppliedJobsTask.last', 'appliedJobs')
  get noAppliedJobs() {
    return this.fetchAppliedJobsTask.last && !this.appliedJobs.length
  }

  @computed('fetchWishlistCoursesTask.last', 'wishlist')
  get noWishlist() {
    return this.fetchWishlistCoursesTask.last && !this.wishlist.length
  }

  @computed('fetchCoursesTask.last', 'runs')
  get noRuns() {
    return this.fetchCoursesTask.last && !this.runs.length
  }

  @restartableTask fetchPerformanceStatsTask = function *() {
    return yield this.api.request(`progresses/stats/${this.lastAccessedRun.get('topRunAttempt.id')}`)
  }

  @restartableTask fetchAppliedJobsTask = function *() {
    return yield this.store.query('job', {
      filter: {
        eligibilityStatus: 'applied'
      },
      include: 'company',
      sort: '-postedOn',
      page: {
        limit: 2
      }
    })
  }

  @restartableTask fetchWishlistCoursesTask = function *() {
    return yield this.store.query('user-course-wishlist', {
      include: 'course',
      exclude: 'course.*',
      page: {
        limit: 2
      }
    })
  }

  @restartableTask fetchCoursesTask = function* () {
    return yield this.store.query("run", {
      include: "course,run_attempts",
      enrolled: true,
      page: {
        limit: 5
      }
    });
  }
}
