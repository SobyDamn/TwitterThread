function printDiv(divName=null){
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}
const urlParams = new URLSearchParams(window.location.search)
const threadID = urlParams.get('threadID') ? urlParams.get('threadID') : '0'
function fetchThread() {
    //Fetch thread if it exists then show else show no thread exists with that id  
    thread = new ThreadViewer(threadID);
    thread.show()
}
class ThreadViewer {
    constructor(thread_id,directory="threads"){
        this.id = thread_id
        this.threadRef = firebase.firestore().collection(directory).doc(this.id);
        
    }
    show() {
        let threadDetails
        this.threadRef.get().then(function(doc) {
            if (doc.exists) {
                threadDetails = doc.data()
                //console.log(threadDetails)
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
                document.getElementById("thread-loader").style.display = "none";
                document.getElementById("thread-404").style.display = "block";
                document.getElementById("thread").style.display = "none";
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
            document.getElementById("thread-loader").style.display = "none";
            document.getElementById("thread-404").style.display = "block";
            document.getElementById("thread").style.display = "none";
        }).then(()=>{
            if (threadDetails){
                this.createThread(threadDetails)
            }
        }).then(()=>{
            if (threadDetails){
                //console.log("Show page")
                document.getElementById("thread-loader").style.display = "none";
                document.getElementById("thread-404").style.display = "none";
                document.getElementById("thread").style.display = "block";
                document.title = "Thread by "+threadDetails.name + " - "+this.id
            }
        })
    }
    
    createThread(thread_details) {
        var dom = `${this.createUserDetail(thread_details.name,thread_details.username,imageSizeModifier(thread_details.profile_img))}\n`
        dom+=this.compileTweets(thread_details.tweets,thread_details.username)
        document.getElementById("thread").innerHTML = dom
    }
    compileTweets(tweets,username){
        var dom = `<div id="thread-holder">`
        for (var i=0;i<tweets.length;i++){
            dom+=this.createTweet(removeUrl(tweets[i].text),tweets[i].date,username,tweets[i].tweet_id,tweets[i].medias,tweets[i].urls)
        }
        dom+=`</div>`
        return dom;
    }
    createUserDetail(name,username,image){
        var dom = `<div id="user">
                        <div id="user-img">
                            <img src="${imageSizeModifier(image)}" alt="Display Picture">
                        </div>
                        <div id="user-details">
                            <div>
                                <a href="https://twitter.com/${username}" id="user-name">${name}</a>
                                <br>
                                <a href="https://twitter.com/${username}" id="user-username">@${username}</a>
                            </div>
                        </div>
                    </div>`
        return dom
    }
    createTweet(text,time,username,id,medias,urls){
        var dom = `<div class="tweet">
                        <label class="tweet-time">${lameDateTime(time)}</label>
                        <br>
                        <a href="https://twitter.com/${username}/status/${id}" class="tweet-text">
                            ${text}
                            <br>
                            ${this.createUrls(urls)}
                        </a>
                        <div class="tweet-media-container">
                            <div class="tweet-media-container-pair">
                                ${this.createTweetMediaBox(medias[0])}
                                ${this.createTweetMediaBox(medias[1])}
                            </div>
                            <div class="tweet-media-container-pair">
                                ${this.createTweetMediaBox(medias[2])}
                                ${this.createTweetMediaBox(medias[3])}
                            </div>
                        </div>
                    </div>`
        return dom
    }
    createUrls(urls){
        var dom = ''
        if (urls.length){
            for(var i=0;i<urls.length;i++){
                dom += `<a href="${urls[i]["expanded_url"]}" class="tweet-text-link">
                            ${urls[i]["display_url"]}
                        </a><br>`
            }
        }
        return dom
    }
    createTweetMediaBox(media){
        var dom = ``
        if(media){
            if (media['type']=="video"){
                dom = `<div class="tweet-media-box">
                            <img class = "tweet-media" src="${media.media_url}" alt="Tweet Image"/>
                            <a href="${media.expanded_url}" class="media-play-overlay" style="display:block;">
                                <img src="media-play-button.png" alt="Play Video"/>
                            </a>
                        </div>`
            }
            else {
                dom = `<a href="${media.media_url}" class="tweet-media-box">
                            <img class = "tweet-media" src="${media.media_url}" alt="Tweet Image"/>
                            <a href="${media.expanded_url}" class="media-play-overlay">
                                <img src="media-play-button.png" alt="Play Video"/>
                            </a>
                        </a>`
            }
        }
        return dom
    }
}
function imageSizeModifier(str){
    /**
     * Change profile image string to show good quality image
     */
    return str.replace("normal", "400x400")
}
function lameDateTime(x) {
    /**
     * Converts given date string in pretty format
     */
    var tempDate = new Date(x)
    var date = new Date(tempDate.getTime() + (5.50)*60*60000)
    var monthsArray = new Array('Jan', 'Feb', 'Mar', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')
    var day = date.getDate()
    var month = date.getMonth()
    var year = date.getFullYear()
    var hours = date.getHours()
    var min = date.getMinutes()
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    var outPutDate = `${day} ${monthsArray[month]},${year} ${hours}:${min} ${ampm}`
    return outPutDate;
}
function removeUrl(str){
    return str.replace(/(?:https):\/\/(t.co?)[\n\S]+/g, '');
}
function openMedia(url){
    console.log(url)
}