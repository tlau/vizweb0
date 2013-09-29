// Define views and templates in the application here

Session.set('nodeName', '');
Session.set('nodeConnections', []);

var selectedNode = null;

Template.json.data = JSON.stringify([{
  "id":"chris",
  "name":"Chris",
  "data":{
    "$color":"#ff0000",
    "$type":"circle",
    "$dim":10
  },
  "adjacencies": [
    "tessa", "melissa", "cameron", "dave"
  ]
}, {
  "id":"tessa",
  "name":"Tessa",
  "data":{
    "$color":"#eedd22",
    "$type":"triangle",
    "$dim":10
  },
  "adjacencies": [
    "chris", "melissa", "dave"
  ]
}, {
  "id":"melissa",
  "name":"Melissa",
  "data":{
    "$color":"#7a78ef",
    "$type":"triangle",
    "$dim":10
  },
  "adjacencies": [
    "chris", "tessa"
  ]
}, {
  "id":"dave",
  "name":"David",
  "data":{
    "$color":"#00ff00",
    "$type":"circle",
    "$dim":10
  },
  "adjacencies": [
    "chris", "cameron"
  ]
}, {
  "id":"cameron",
  "name":"Cameron",
  "data":{
    "$color":"#0000ff",
    "$type":"circle",
    "$dim":10
  },
  "adjacencies": [
    "chris", "dave"
  ]
}]);

var fd;

Template.start.rendered = function() {
  fd = new $jit.ForceDirected({
    injectInto: 'graph',
    Navigation: {
      enable: false,
      panning: 'avoid nodes',
      zooming: 10
    },
    Node: {
      overridable: true
    },
    Edge: {
      overridable: true,
      color: '#23A4FF',
      lineWidth: 0.4
    },
    Label: {
      type: 'HTML',
      size: 10,
      style: 'bold'
    },
    Tips: {
      enable: true,
      onShow: function(tip, node) {
        var count = 0;
        node.eachAdjacency(function() {count++});
        tip.innerHTML = "<div class=\"tip-title\">" + node.name + "</div>"
          + "<div class=\"tip-text\"><b>Connections:</b> " + count + "</div>";
      }
    },
    onCreateLabel: function(domElement, node) {
      domElement.innerHTML = node.name;
      var style = domElement.style;
      style.fontSize = "0.8em";
      style.color = "#ddd";
    },
    onPlaceLabel: function(domElement, node) {
      var style = domElement.style;
      var left = parseInt(style.left);
      var top = parseInt(style.top);
      var w = domElement.offsetWidth;
      style.left = (left - w / 2) + 'px';
      style.top = (top + 10) + 'px';
      style.display = '';
    },
    levelDistance: 130,
    iterations: 200,
    Events: {
      enable: true,
      type: 'Native',
      onMouseEnter: function() {
        fd.canvas.getElement().style.cursor = 'move';
      },
      onMouseLeave: function() {
        fd.canvas.getElement().style.cursor = '';
      },
      onDragMove: function(node, evInfo, e) {
        var pos = evInfo.getPos();
        node.pos.setc(pos.x, pos.y);
        fd.plot();
      },
      onTouchMove: function(node, evInfo, e) {
        $jit.util.event.stop(e);
        this.onDragMove(node, evInfo, e);
      },
      onClick: function(node) {
        if (!node) return;
        Session.set('nodeName', node.name);
        var conn = [];

        // Unselect last selected
        if (selectedNode) {
          selectedNode.eachAdjacency(function(adj) {
            adj.setDataset('end', {
              lineWidth: 0.4,
              color: '#23a4ff'
            });
          });
        }

        if (selectedNode == node) {
          selectedNode = null;
        } else {
          selectedNode = node;
          node.eachAdjacency(function(adj) {
            adj.setDataset('end', {
              lineWidth: 3,
              color: '#36acfb'
            });
          });
        }
        node.eachAdjacency(function(adj) {
          conn.push({'name': adj.nodeTo.name});
        });
        Session.set('nodeConnections', conn);
        fd.fx.animate({
          modes: ['node-property:dim',
            'edge-property:lineWidth:color'],
          duration: 500
        });
      }
    }
  });

  fd.loadJSON(JSON.parse(Template.json.data));

  fd.computeIncremental({
    iter: 40,
    property: 'end',
    onStep: function(perc){
      console.log(perc + '% loaded...');
    },
    onComplete: function(){
      console.log('done');
      fd.animate({
        modes: ['linear'],
        transition: $jit.Trans.Elastic.easeOut,
        duration: 2500
      });
    }
  });
}

Template.nodedata.nodename = function() {
  return Session.get('nodeName');
};
Template.nodedata.connections = function() {
  return Session.get('nodeConnections');
};

Template.json.events({
  'click #update': function () {
    fd.loadJSON(JSON.parse($('.json').val()));

    fd.computeIncremental({
      iter: 40,
      property: 'end',
      onStep: function(perc){
        console.log(perc + '% loaded...');
      },
      onComplete: function(){
        console.log('done');
        fd.animate({
          modes: ['linear'],
          transition: $jit.Trans.Elastic.easeOut,
          duration: 2500
        });
      }
    });
  }
});
