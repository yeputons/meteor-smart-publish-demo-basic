Items = new Mongo.Collection('items');
Authors = new Mongo.Collection('author');

if (Meteor.isClient) {
  Template.main.helpers({
    items: function() {
      return Items.find({}, {sort: ['authorId', 'allowExtra', '_id']});
    },
    authors: function() {
      return Authors.find();
    }
  });

  Template.item.events({
    'change input': function(ev, instance) {
      Items.update(this._id, {$set: {enabled: !!ev.target.checked}});
    }
  });

  Meteor.subscribe('items-disabled');
  Meteor.subscribe('items-enabled');
}

if (Meteor.isServer) {
  if (Items.find().count() == 0) {
    var ids = [];
    for (var i = 0; i < 10; i++) {
      ids.push(Authors.insert({id: i, extra: 'Extra for ' + i}));
    }
    for (var i = 0; i < 30; i++) {
      var a = Math.floor(Math.random() * (10 - 1e-9));
      Items.insert({author: ids[a], authorId: a, enabled: false, allowExtra: Math.random() < 0.5});
    }
  }
  Meteor.publish('items-disabled', function() {
    return Items.find({enabled: false});
  });
  Meteor.smartPublish('items-enabled', function() {
    this.addDependency('items', ['author', 'allowExtra'], function(item) {
      fields = {};
      if (!item.allowExtra) {
        fields['extra'] = 0;
      }
      return Authors.find(item.author, {fields: fields});
    });
    return Items.find({enabled: true});
  });
}
