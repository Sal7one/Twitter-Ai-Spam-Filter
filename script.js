window.onload = function () {
  let apiurl = "";
  let twitterurl = window.location;
  let tweetlisttag = '[aria-label="Timeline: Search timeline"]';
  let commentlisttag = '[aria-label="Timeline: Search timeline"]';
  var tweetlist = "";
  var arrived = false;
  var requests = 0;
  var didScroll;
  var lastScrollTop = 0;
  var delta = 290;

  document.arrive('[aria-label="Timeline: Search timeline"]', function () {
    arrived = true;
    tweetlist = document.querySelector(tweetlisttag);
    tweetlist = tweetlist.children[0].children[0];
    keephiding();
  });

  function keephiding() {
    numoftweets = 0;

    for (childrenn in tweetlist.children) {
      if (tweetlist.children[childrenn].tagName == "DIV") {
        numoftweets++;
      }
    }

    var Tweetsarray = {};

    for (i = 0; i < numoftweets; i++) {
      try {
        var tweetbox =
          tweetlist.children[i].children[0].children[0].children[0].children[0]
            .children[0].children[0].children[1].children[1].children[1]
            .children[0].children[0];

        if (!tweetbox.hasAttribute("lang")) {
          //The tweet is a reply or a retweeet
          tweetbox =
            tweetlist.children[i].children[0].children[0].children[0]
              .children[0].children[0].children[0].children[1].children[1]
              .children[1].children[1].children[0];
        }

        var tweettext = "";

        for (j = 0; j < tweetbox.children.length; j++) {
          if (!(tweetbox.children[j].children.length > 0)) {
            tweettext += tweetbox.children[j].innerText;
          } else if (
            tweetbox.children[j].children.length > 0 &&
            tweetbox.children[j].children[0].tagName == "A"
          ) {
            tweettext += tweetbox.children[j].children[0].innerText;
          }
        }

        Tweetsarray[i] = tweettext;
        if (i == numoftweets - 1) {
          let spam = requestapi(Tweetsarray);
          for (l = 0; l < spam.length; l++) {
            if (spam[l] == true) {
              console.log("spam found");
              tweetlist.children[l].style.display = "none";
            }
          }
        }
      } catch (error) {
        continue;
      }
    }
  }

  function requestapi(thetweets) {
    var form_data = new FormData();
    let spamlist = [];

    for (var key in thetweets) {
      form_data.append(key, thetweets[key]);
    }
    JSON.stringify(form_data);

    $.ajax({
      url: apiurl,
      type: "POST",
      data: form_data,
      async: false,
      processData: false,
      contentType: false,
      success: function (response) {
        requests += +1;
        console.log("reques \n\n", requests);
        for (i = 0; i < Object.keys(response.data).length; i++) {
          try {
            spamlist[i] = response.data[i].is_spam;
          } catch (error) {
            spamlist[i] = "not a correct tweet to check";
          }
        }
      },
      error: function (error) {
        console.log("Something went wrong with the ai server contact ", error);
      },
    });

    return spamlist;
  }

  $(window).scroll(function (event) {
    didScroll = true;
  });

  setInterval(function () {
    if (didScroll) {
      hasScrolled();
      didScroll = false;
    }
  }, 250);

  function hasScrolled() {
    var st = $(this).scrollTop();

    // Return if they scroll less than 20px (delta)
    if (Math.abs(lastScrollTop - st) <= delta) return;

    // Do what you want here
    try {
      keephiding();
    } catch (error) {}

    lastScrollTop = st;
  }
};
