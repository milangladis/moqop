import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import Header from 'components/header'
import Footer from 'components/footer'
import Integration from 'components/integration'
import Slider from 'components/slider'

import polyline from '@mapbox/polyline'
import Canvas from 'canvas'

// import User from 'components/user'

import Button from 'components/button'
import Theme from 'themes/strava/strava1'
import Seturl from 'components/seturl'

import { useEffect, useState, useRef } from 'react'
import {formatPace} from '../../api/utils/functions'

export default function Home(props) {
  
  var initialData = {
    code: 101,
    errors: 'Loading',
    message: 'Data are being fetched.'
  }

  const [modalState, setModalState] = useState({
    show: false
  });
  const [loadingImage, setLoadingImage] = useState('');
  const [showQuestionnaire, setShowQuestionnaire] = useState(true);


  const [activityData, setActivityData] = useState(initialData);
  const [userData, setUserData] = useState(initialData);
  
  const [itemsToShow, setItemsToShow] = useState(5);
  const imageRef = useRef(null)

  function formatSeconds(time) {
    var hrs = ~~(time / 3600);
    var mins = ~~((time % 3600) / 60);
    var secs = ~~time % 60;
  
    // Output like "1:01" or "4:03:59" or "123:03:59"
    var ret = "";
    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }
    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;
    return ret;
  }

  // function formatPace(timeInSeconds, distanceInMetres) {
  //   var pace = (timeInSeconds/distanceInMetres)/60*1000;
  //   var leftover = pace % 1;
  //   var minutes = pace - leftover;
  //   var seconds = Math.round(leftover * 60);
  //   if (seconds < 10) {
  //     seconds = `0${seconds}`
  //   }
  //   var finalPace = minutes+":"+seconds
  //   return finalPace
  // }

  function renderCanvas(data) {

    if (data === null) {
      return
    }
    var Image = Canvas.Image;
    var canvas = Canvas.createCanvas(64, 64);
    var context = canvas.getContext('2d');
    let arr = polyline.decode(data);

    context.clearRect(0, 0, canvas.width, canvas.height);
    var minX, minY, maxX, maxY;
    var firstPoint = [0,0]
    arr.forEach((p, i) => {
      if (i === 0) {
        // if first point
        minX = maxX = p[1];
        minY = maxY = p[0];
      } else {
        minX = Math.min(p[1], minX);
        minY = Math.min(p[0], minY);
        maxX = Math.max(p[1], maxX);
        maxY = Math.max(p[0], maxY);
      }
    });

    // console.log(minX, minY, maxX, maxY)

    // now get the map width and heigth in its local coords
    const mapWidth = maxX - minX;
    const mapHeight = maxY - minY;
    const mapCenterX = (maxX + minX) / 2;
    const mapCenterY = (maxY + minY) / 2;

    // console.log(mapWidth, mapHeight, mapCenterX, mapCenterY)

    // to find the scale that will fit the canvas get the min scale to fit height or width
    var scale = Math.min(canvas.width / mapWidth, canvas.height / mapHeight) * 0.6;

    // Now you can draw the map centered on the cavas
    context.beginPath();
    // console.log(arr[0][0]);
    
    arr.forEach((p, i) => {
      if (i === 0) {
        firstPoint[0] = (p[1] - mapCenterX) * scale + canvas.width / 2
        firstPoint[1] = (p[0] - mapCenterY) * -scale*1.5 + canvas.height / 2
      }
      context.lineTo(
        (p[1] - mapCenterX) * scale + canvas.width / 2,
        (p[0] - mapCenterY) * -scale*1.5 + canvas.height / 2
      );
    });

    // TODO - make it rounded
    // https://stackoverflow.com/questions/29074956/in-mapbox-js-how-to-smooth-a-polyline

    context.lineWidth = 2;
    context.strokeStyle = '#38424b';
    context.lineJoin = "round";
    context.lineCap = 'round',
    context.stroke();

    const radius = 3;
    const x = firstPoint[0]
    const y = firstPoint[1]
    context.beginPath();
    // console.log('radius: ' + radius)
   
    // Clearing circle
    // context.arc(x, y, radius, 0, 2 * Math.PI, false);
    // context.clip()
    // context.clearRect(x - radius, y-radius, x + radius*2, y + radius*2);
    // console.log('firstPoint: ' + firstPoint)
    
    // Starting point circle
    context.beginPath();
    context.lineWidth = 4;
    context.strokeStyle = '#38424b';
    context.arc(x, y, radius, 0, 2 * Math.PI, false);
    // console.log('radius: ' + radius)
    context.fill();

    // save canvas image as data url (png format by default)
    return canvas.toDataURL();
  }

  
  useEffect(() => {

    fetch(`/api/user`)
      .then(response => response.json())
      .then(userData => {
        // console.log('Fetch: User')
        if (!userData.errors) {
          setUserData({
            code: 200,
            message: 'User logged in',
            data: userData
          })
          // console.log(userData)  
          fetch(`/api/activity`)
          .then(response => response.json())
          .then(data => {
            // console.log('Fetch: Activity')
            if(data.length == 0) {
              setActivityData({
                code: 204,
                errors: 'No content',
                message: 'User does not have any activities to show.'
              })
              // console.log(userData)
            } else if(data.errors) {
              setActivityData({
                code: 401,
                errors: 'No activity because unauthorised user',
                data: data.errors[0]
              })
              setUserData({
                code: 401,
                errors: 'User is not logged in',
                data: userData
              })
            } else {
              setActivityData({
                code: 200,
                message: 'Activities are available to show.',
                data: data
              })
              // console.log(data)
            }
          })
          .catch(rejected => {
            // console.log(rejected)
            setActivityData({
              code: 404,
              message: 'Activity response has been rejected.',
            })
          });
        } else {
          setUserData({
            code: 401,
            errors: 'Unauthorized',
            message: 'User is not logged in.'
          })
        }
      })
      .catch(rejected => {
        // console.log(rejected)
        setUserData({
          code: 404,
          message: 'User response has been rejected.',
        })
      });


  }, [])


  // console.log(userData)
  // console.log(activityData)


  useEffect(() => {
    const data = window.localStorage.getItem('MY_APP_STATE');
    if ( data !== null ) setShowQuestionnaire(JSON.parse(data));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('MY_APP_STATE', JSON.stringify(showQuestionnaire));
  }, [showQuestionnaire]);
  
  // Countdown for loading state

  const disablePopup = () => {
    setModalState({show: false})
  }

  //add esc eventlistener and disablePopup when modalState is true
  useEffect(() => {
    const escFunction = (event) => {
      if(event.keyCode === 27) {
        disablePopup()
      }
    }
    if(modalState.show) { 
      document.addEventListener("keydown", escFunction, false);
    }
    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, [modalState.show])

  const pickResolution = async(id) => {
    // Todo: implement popup showcase
  }

  const modalResolution = async(activityId) => {
    // console.log(activityId)
    setModalState({
      show: true,
      type: 'resolution',
      id: activityId
    })
  }

  // var test = modalState
  const modalDownloadImage = async(resolutionType) => {
    let id = modalState.id
    setLoadingImage('')
    setModalState({
      show: true,
      type: 'loading'
    })
    // var imageUrl = `${server()}/api/render/strava/${id}`
    // console.log(imageUrl)
    
    // await fetch(`/api/render/strava/${id}?resolution=square`)
    await fetch(`/api/render/strava/${id}${resolutionType === 'post' ? '?resolution=square' : ''}`)
      .then(res => res.blob()) // Gets the response and returns it as a blob
      .then(blob => {
        const objectURL = URL.createObjectURL(blob);
        setLoadingImage(objectURL)
        setModalState({
          show: true,
          type: 'download'
        })
        imageRef.current.src = objectURL;
      }).catch(error => {
        console.log(error)
      });

  }


  const numberPerPage = 5
  const showmore = () => {
    const showItem = itemsToShow + numberPerPage
    setItemsToShow(showItem)
  }


    //   console.log('User components:')
    // console.log(User)


  return (
    <div className="">
      <Head>
        <title>Moqop · Generate Instagram Story from Strava activity</title>
        <meta name="description" content="Visualise your exercise activity for Instagram story with a decent polyline over the picture you made during the workout." />
      </Head>

      <section>
        <Header user={userData} />
      </section>
      <div className="page">
        <section>

          { (userData.code === 401) ?
            <>
              <h1 className="title text-32 sm:text-40 md:text-48 font-black text-center">
                Generate Instagram story <br className='hidden md:block' /> 
                <span className='titleColor inline'>from Strava activity</span>
              </h1>
              <div className='text-18 md:w-2/3 text-center mt-24 mx-auto mb-32 font-semibold'>Visualise your exercise activity for Instagram story with a decent polyline over the picture you made during the workout.</div>
            </>
          : ''}

          { userData.code == 101 ? '' : <Integration loginButton={userData.errors ? true : false}/>}
        </section>


        { (userData.code === 401) ?
          // Examples
            <Slider />
           : '' }

        { (userData.code === 401) ?
          <>
            <section className='my-64 text-center md:text-left'>
              <div className="flex flex-col md:flex-row gap-64">
                <div className='flex flex-1 flex-col justify-center'>
                  <div className="uppercase font-bold opacity-50">Output in seconds</div>
                  <h2 className='text-40 font-black mb-16'>Design <span className='text-orange'>100x faster</span> <br className='hidden sm:block' /> than Graphic Designer</h2>
                  <div className="text-18">Spend more time on pushing your data and less on the designing <strong>social media content</strong>. Time to get result is less than you need to lace your running shoes laces.</div>
                </div>
                <div className="flex-1 flex justify-center">
                  <Image src="/images/content/generation.jpg" width="427" height="339" alt="generation" />
                </div>
              </div>

              <div className="flex flex-col-reverse md:flex-row gap-64 mt-64">
                <div className="flex-1 flex justify-center">
                  <Image src="/images/content/posts.jpg" width="403" height="363" alt="post" />
                </div>
                <div className='flex flex-1 flex-col justify-center'>
                  <div className="uppercase font-bold opacity-50">Output in seconds</div>
                  <h2 className='text-40 font-black k mb-16'>Share immersive <br className='hidden sm:block' /> <span className='text-blue'>social media</span> posts</h2>
                  <div className="text-18"><strong>Predefined template</strong> keep your feed consistent and future features will allow you to personalize posts by using <strong>custom modifications</strong>.</div>
                </div>
              </div>

              <div className="text-center mt-80">
                <h2 className='text-40 font-black k mb-16'>How to use Moqop?</h2>
                <div className="text-18">Watch a short video about how to set up strava activity to get solid results.</div>
                <div className="flex flex-col text-left gap-16 mt-32 max-w-[500px] m-auto">
                  <div className="flex flex-1 items-center px-32 py-16 border border-grey-darken rounded cursor-default hover:bg-grey/50 ">
                    <span className='text-40 font-bold text-[#7475D5]'>1</span>
                    <div className="ml-32">
                      <h3 className='text-20 font-semibold mb-4'>Save Strava activity</h3>
                      <span className='text-16 opacity-50'>Finish your workout in Strava and make sure everything's saved.</span>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center px-32 py-16 border border-grey-darken rounded cursor-default hover:bg-grey/50 ">
                    <span className='text-40 font-bold text-[#AD6881]'>2</span>
                    <div className="ml-32">
                      <h3 className='text-20 font-semibold mb-4'>Import image to Strava</h3>
                      <span className='text-16 opacity-50'>Upload photo to your Strava Activity, otherwise it won't appear in Moqop.</span>
                    </div>
                  </div>
                  <div className="flex flex-1 items-center px-32 py-16 border border-grey-darken rounded cursor-default hover:bg-grey/50 ">
                    <span className='text-40 font-bold text-[#DF5D3A]'>3</span>
                    <div className="ml-32">
                      <h3 className='text-20 font-semibold mb-4'>Generate image with Moqop</h3>
                      <span className='text-16 opacity-50'>Connect your Strava and generate Instagram Story with Moqop</span>
                    </div>
                  </div>
                  <div className='mt-8 border-grey'>
                    <Button text="Connect with Strava" href="/auth/strava" size="large" className="mt-8 bg-orange w-full" />
                  </div>
                </div>


              </div>
            
            </section>

            <div className="gradientFeedback text-center py-80">
              <h2 className='text-40 font-black k mb-16'>Appreciate <span className='titleColor inline'>your feedback</span></h2>
              <div className="text-18">Moqop needs your help by testing the product, providing good <br className='hidden md:block' />  or bad feedback, and suggesting new features. <br className='hidden md:block' /> Thanks a lot 🙏</div>

              <a href="mailto:hello@moqop.com" target="_blank" className='inline-block bg-black text-white mt-32 py-16 px-32 text-16 font-semibold rounded'>Send a feedback</a>
            </div>
          </>
        : '' }

        <section>

          { (!userData.errors && activityData.code === 200) ? 
            <div className="sectionBlock">
              { activityData.data.slice(0, itemsToShow).map(function(key, index){
                var distance = `${+parseFloat(key.distance/1000).toFixed(2)} km`;
                var time = formatSeconds(key.moving_time)
                return (
                  <div key={index}>
                    {/* <Link href={`${server()}/api/render/strava/${key.id}`}> */}
                    <div>
                      <div className='flex items-center rounded-4 mb-8  py-8 px-8 bg-grey/50 hover:bg-grey cursor-pointer' onClick={() => modalResolution(key.id)} activityid={key.id}>
                        {key.map ? 
                          <img src={renderCanvas(key.map.summary_polyline)} className="w-32 h-32 ml-4 mr-16 opacity-50" />
                        : ''}
                        <div className='flex flex-col justify-center overflow-hidden pr-16'>
                          <span className='mt-4 leading-7 max-w-full whitespace-nowrap overflow-hidden text-ellipsis'>{key.name}</span>
                          <span className='block text-12 opacity-50 leading-7'>{key.type} · {distance} · {key.total_elevation_gain > 100 ? `${Math.ceil(key.total_elevation_gain)} m` : `${formatPace(key.moving_time, key.distance)} /km`} · {time}</span>
                        </div>
                        {(key.total_photo_count == 0) ? <div className="text-12 border-red border text-red rounded px-8 ml-auto mr-8 whitespace-nowrap">No image</div> : '' }
                      </div>
                    {/* </Link> */}
                    </div>
                    {/* <div className="border-b border-grey mb-4 mx-4"></div> */}
                  </div>
                )
              }) }
            </div>
          : '' }

          { (!userData.errors && activityData.code === 204) ? 
            <div className='flex justify-center text-center rounded-4 mb-8 border-grey p-16 bg-grey'>
              You don't have any activity yet. <br />
              Let's record some activity on Strava first.
            </div> : '' }

          { (!userData.errors && activityData.code === 101) ? 
            <div className='sectionBlock'>
              <LoadingRow />
              <LoadingRow className="opacity-70" />
              <LoadingRow className="opacity-40" />
            </div> 
          : '' }

          { !userData.errors && activityData.code === 200 && (activityData.data.length > itemsToShow) ?
            <div className="sectionBlock">
              <button onClick={showmore} className="w-full rounded-4 mb-8 leading-7 py-8 bg-grey/50 hover:bg-grey mt-8 m-auto font-semibold text-center text-black/70">Show more</button>
            </div> : ''}




          { <div className={`fixed transition top-0 left-0 right-0 bottom-0 z-50 text-center ${modalState.show ? ' opacity-100 pointer-events-auto': ' opacity-0 pointer-events-none'}`}>
            <div className="mq:backdrop flex items-center justify-center w-full h-full bg-black/95" onClick={() => disablePopup()}></div>
            {/* <div className='absolute flex flex-col justify-center top-24 right-24 bottom-24 left-24 z-50 bg-white rounded-12 drop-shadow-md p-16'> */}
            <div className='absolute flex flex-col justify-center top-0 right-0 bottom-0 left-0 z-50 bg-white p-32 drop-shadow-md'>

                
                {modalState.show ?
                  <div className="absolute w-64 h-64 top-0 right-0 flex items-center justify-center cursor-pointer hover:bg-grey" onClick={() => disablePopup()}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 6L18 18M18 6L6 18" stroke="black" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                : ''}



                {modalState.type === "resolution" ?
                  <div className='flex justify-center gap-32'>
                    <div className='cursor-pointer' onClick={() => modalDownloadImage('post')}>
                      <Image width={220} height={336} alt="Format Post" src="/images/content/formatPost.svg" className='hover:shadow-outline transition rounded-12' />
                      <span className='block pt-16'>Square</span>
                      <span className='block opacity-50 text-12'>1:1 · 1920 x 1920</span>
                    </div>
                    <div className='cursor-pointer' onClick={() => modalDownloadImage('story')}>
                      <Image width={220} height={336} alt="Format Story" src="/images/content/formatStory.svg" className='hover:shadow-outline transition rounded-12' />
                      <span className='block pt-16'>Portrait</span>
                      <span className='block opacity-50 text-12'>9:16 · 1080x1920</span>
                    </div>
                  </div>
                : ''}

                  {modalState.type === 'download' ?
                    <div className='font-semibold'>  
                      <div className="">
                        <div className="flex flex-col mb-16 px-8 p-8">
                            <div className="font-bold">Download image </div>
                            <div className='opacity-70 text-12 leading-6 mt-4'>Long-press or right-click the image to download so you can share it on Instagram as a Story.</div>
                        </div>
                      </div>
                    </div>
                  : ''}

                  {modalState.type === 'loading' ?
                    <div className='font-semibold'>  
                      <span>
                        <div className="mx-auto my-32 w-32 h-32 border-2 border-transparent border-r-blue rounded-full animate-spin"></div>
                        <div className="text-16 font-bold mb-8">Rendering image </div>
                        <div className="opacity-70">Your image's beeing generated,<br />it may take up to 5 seconds.</div>
                      </span> 
                    </div> 
                  : ''}
                
                {modalState.type === 'download' ?
                  // <a href={loadingImage} className=' max-h-[70vh] flex-1 overflow-hidden mt-8' download="moqop.jpg">
                  <div className='flex h-full flex-1 overflow-hidden'>
                    <img ref={imageRef} src={loadingImage} className="object-contain w-auto max-h-full rounded-8 block m-auto" />
                  </div>
                : ''}
                {(modalState.type === 'download' && showQuestionnaire) ?
                  <div className="flex flex-col px-16 pt-16 -mx-32 -mb-16 gap-4 text-12 justify-center items-center">
                      <div className="">Would you mind sharing your feedback?</div>
                      <a href='https://forms.gle/38hJsbRgjCi9bFbp7' target='_blank' className="flex items-center gap-4 bg-grey py-4 px-8 rounded font-semibold pointer" onClick={() => setShowQuestionnaire(false)}>
                        Open questionnaire
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.3999 7.59995L12.7999 3.19995M12.7999 3.19995H8.7999M12.7999 3.19995V7.19995" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M11.2 10.4V12.8H3.19995V4.80005H5.59995" stroke="black" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>

                      </a>
                      {/* <div className="">Do you like the result? </div> */}
                      {/* <div className='flex justify-center gap-8 mt-2 font-semibold'>
                      <div className="bg-grey py-4 px-8 rounded">Yes 👍</div>
                        <div className="bg-grey py-4 px-8 rounded">No 👎</div>
                      </div> */}
                  </div>
                : ''}
              {/* </div> */}
            </div>
          </div> }
        </section>

      </div>{/* container */}

      <section>
        <Footer />
      </section>
    </div>
  )
}


function LoadingRow(props) {
  // console.log(props.className)
  return (
    <div className={`flex items-center gap-16 text-center rounded-4 h-[55px] mb-8 p-8 bg-grey text-black/50 ${props.className}`}>
      <div className='block w-32 h-32 bg-black/10 ml-4 rounded'></div>
      <div className='flex flex-1 flex-col justify-center'>
          <div className='block h-8 w-1/3 bg-black/10 mb-8 rounded'></div>
          <div className='block h-8 w-1/4 bg-black/10 rounded'></div>
      </div>
    </div>
  )
}