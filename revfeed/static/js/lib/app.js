// Generated by CoffeeScript 1.3.3
var Commit, CommitItem, Revfeed, RevfeedCommit, Templates, WEB_SOCKET_SWF_LOCATION, notifier, path, resource,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Commit = (function(_super) {

  __extends(Commit, _super);

  function Commit() {
    this.formattedTime = __bind(this.formattedTime, this);
    return Commit.__super__.constructor.apply(this, arguments);
  }

  Commit.configure("Commit", "author_avatar", "author_name", "author_email", "message", "time", "repo_name", "new");

  Commit.extend(Spine.Model.Ajax);

  Commit.prototype.formattedTime = function() {
    return moment.utc(this.time * 1000).calendar();
  };

  return Commit;

})(Spine.Model);

RevfeedCommit = (function(_super) {

  __extends(RevfeedCommit, _super);

  function RevfeedCommit() {
    return RevfeedCommit.__super__.constructor.apply(this, arguments);
  }

  RevfeedCommit.extend({
    url: "api/revfeed",
    fromJSON: function(objects) {
      var commit, _i, _len, _ref, _results;
      if (!objects) {
        return;
      }
      this.nextURL = objects.next_url;
      _ref = objects.commits;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        commit = _ref[_i];
        _results.push(new RevfeedCommit(commit));
      }
      return _results;
    }
  });

  return RevfeedCommit;

})(Commit);

Revfeed = (function(_super) {

  __extends(Revfeed, _super);

  Revfeed.prototype.elements = {
    ".commits": "$commits",
    ".older": "$older",
    ".new-commits": "$newCommits"
  };

  Revfeed.prototype.events = {
    "click .older a": "olderCommits",
    "click .new-commits a": "showNewCommits"
  };

  Revfeed.prototype.newCommits = 0;

  function Revfeed() {
    this.showNewCommits = __bind(this.showNewCommits, this);

    this.olderCommits = __bind(this.olderCommits, this);

    this.addCommits = __bind(this.addCommits, this);

    this.addCommit = __bind(this.addCommit, this);
    Revfeed.__super__.constructor.apply(this, arguments);
    RevfeedCommit.bind("create", this.addCommit);
    RevfeedCommit.bind("refresh", this.addCommits);
    RevfeedCommit.fetch();
    return;
  }

  Revfeed.prototype.getLabelColor = function(repoName) {
    var b, c, color, g, r, _ref, _ref1, _ref2;
    color = (_ref = this.labelColors) != null ? _ref[repoName] : void 0;
    if (!color) {
      _ref1 = [0, 0, 0], r = _ref1[0], g = _ref1[1], b = _ref1[2];
      this.labelColors = this.labelColors || {};
      repoName.split("").map(function(c, i) {
        var charCode;
        charCode = c.charCodeAt(0);
        if (!(i % 1)) {
          r += charCode;
        }
        if (!(i % 3)) {
          g += charCode;
        }
        if (!(i % 5)) {
          return b += charCode;
        }
      });
      _ref2 = (function() {
        var _i, _len, _ref2, _results;
        _ref2 = [r, g, b];
        _results = [];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          c = _ref2[_i];
          _results.push(Math.floor((c % 256) * 0.25) + 192);
        }
        return _results;
      })(), r = _ref2[0], g = _ref2[1], b = _ref2[2];
      color = this.labelColors[repoName] = {
        r: r,
        g: g,
        b: b
      };
    }
    return color;
  };

  Revfeed.prototype.addCommit = function(commit) {
    var $commit, commitItem, labelColor;
    commitItem = new CommitItem({
      item: commit
    });
    $commit = commitItem.render().el;
    labelColor = this.getLabelColor(commit.repo_name);
    $(".repo-name", $commit).css("background-color", "rgb(" + labelColor.r + ", " + labelColor.g + ", " + labelColor.b + ")");
    if (commit["new"]) {
      this.newCommits++;
      this.$newCommits.html(Templates.newCommits({
        new_commits: this.newCommits
      })).show();
      this.$commits.prepend($commit.addClass("new"));
    } else {
      this.$commits.append($commit);
    }
  };

  Revfeed.prototype.addCommits = function(commits) {
    commits.forEach(this.addCommit);
  };

  Revfeed.prototype.olderCommits = function(e) {
    e.preventDefault();
    RevfeedCommit.fetch({
      url: RevfeedCommit.nextURL,
      success: this.proxy(function(objects) {
        if (!objects.next_url) {
          return this.$older.hide();
        }
      })
    });
  };

  Revfeed.prototype.showNewCommits = function(e) {
    e.preventDefault();
    this.newCommits = 0;
    this.$newCommits.hide();
    return this.$(".new", this.$commits).removeClass("new");
  };

  return Revfeed;

})(Spine.Controller);

CommitItem = (function(_super) {

  __extends(CommitItem, _super);

  function CommitItem() {
    this.render = __bind(this.render, this);
    return CommitItem.__super__.constructor.apply(this, arguments);
  }

  CommitItem.prototype.tag = "li";

  CommitItem.prototype.className = "commit";

  CommitItem.prototype.render = function() {
    this.html(Templates.commit(this.item));
    return this;
  };

  return CommitItem;

})(Spine.Controller);

Templates = {};

$(function() {
  Mustache.tags = ["<%", "%>"];
  Templates.commit = Mustache.compile($("#commit-template").remove().html());
  Templates.newCommits = Mustache.compile($("#new-commits-template").remove().html());
  return new Revfeed({
    el: $("#revfeed")
  });
});

WEB_SOCKET_SWF_LOCATION = "/static/WebSocketMain.swf";

path = location.pathname.replace(/^\/+|\/+$/g, '');

resource = "socket.io";

if (path.length) {
  resource = "" + path + "/" + resource;
}

notifier = io.connect("/notifier", {
  resource: resource
});

notifier.on("revfeed", function(commits) {
  var commit, _i, _len;
  for (_i = 0, _len = commits.length; _i < _len; _i++) {
    commit = commits[_i];
    commit["new"] = true;
    RevfeedCommit.create(commit, {
      ajax: false
    });
  }
});
