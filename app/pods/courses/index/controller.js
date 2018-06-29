import Ember from 'ember';
import { task } from 'ember-concurrency';

export default Ember.Controller.extend({
  queryParams: ['limit', 'offset'],
  limit: 9,
  offset: 0,

  taskMoreCourses: task(function * () {
    const nextCourses = yield this.store.query ('course', {
      include: 'runs',
      sort: 'difficulty',
      page:{
        limit: this.get('limit'),
        offset: this.get('offset')
      }
    })
    this.get('courses').addObjects(nextCourses)
    this.set('nextOffset', nextCourses.get('meta').pagination.nextOffset)
  }),

  actions:{
    loadMore: function() {
      this.set('offset', this.get('nextOffset'))
    }
  }
})
