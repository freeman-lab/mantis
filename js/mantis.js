Targets = new Meteor.Collection("targets");

if (Meteor.isClient) {
  Template.loaddata.test = function () {
    return Session.get("count");
  };

  Template.loaddata.events({
    'click #fire' : function () {
      console.log("aquiring coordinates");
      Targets.find({}).forEach(function (target) {
        console.log(target.x / 1000)
        console.log(target.y / 516)
      })
    }
  })

  Template.loaddata.events({
    'click #clear' : function () {
      Meteor.call('clearAll');
    }
  })

  Template.loaddata.rendered = function() {

    var w = 1000
    var h = 516
    var thresh = 10
    var svg = d3.select("#imgContainer").append("svg")
    .attr("width", w)
    .attr("height", h)
    .on("mousemove", mousemove)
    .on("mousedown", mousedown)

    svg.append("image")
      .attr("xlink:href", "imgs/test.png")
      .attr("width", w)
      .attr("height", h);

    var nodes = []

    var cursor = svg.append("circle")
    .attr("r", 30)
    .attr("transform", "translate(-100,-100)")
    .attr("class", "cursor");

    var points = svg.selectAll(".target")
    .data(Session.get("targets"))
    .enter()
    .append("circle")
    .attr("class","target")
    .attr("r", 20)
    .attr("cx", (function(d) {return d.x;}))
    .attr("cy", (function(d) {return d.y;}))

    function mousemove() {
      cursor
      .attr("transform", "translate(" + d3.mouse(this) + ")")
    }

    function mousedown() {
      var point = d3.mouse(this)

      var previous = Targets.find({$and: [{x: {$gt: point[0]-thresh}}, {x: {$lt: point[0]+thresh}}, {y: {$gt: point[1]-thresh}}, {y: {$lt: point[1]+thresh}}]})

      if (previous.count() == 0) {
         Targets.insert({x: point[0], y: point[1]})
      } else {
        Targets.remove(previous.fetch()[0]._id)
      }
     
      Session.set("targets",Targets.find({}).fetch())
      Session.set("count",Targets.find({}).count())

    }



  }

}

if (Meteor.isServer) {

  Meteor.startup(function() {
    return Meteor.methods({
      clearAll: function() {
        return Targets.remove({});
      }
    });
  });

}
