var container;

var camera, scene, renderer;
var controls;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


var posKfJSON = {
    name: ".position",
    type: "vector",
    times: [],
    values: []
}
var rxKfJSON = {
    name: ".rotation[x]",
    type: "number",
    times: [],
    values: [],
    interpolation: THREE.InterpolateSmooth
}
var clipJSON = {
    duration: 10,
    tracks: [
        posKfJSON,
        rxKfJSON
    ]
}

var clip, mixer = null;

var loader = new THREE.FileLoader();
loader = loader.load(
    'walk_trj.csv',
    function(data) {
	var tmp = data.split("\n");
	var idx = 0;
	for (var i=0; i<tmp.length; ++i) {
	    var toks = tmp[i].split(',');
	    if (toks.length < 7) continue;
	    posKfJSON.times[idx] = toks[0];
	    posKfJSON.values[idx*3  ] = toks[1];
	    posKfJSON.values[idx*3+1] = toks[2];
	    posKfJSON.values[idx*3+2] = toks[3];
	    rxKfJSON.times[idx]  = toks[0];
	    rxKfJSON.values[idx] = toks[4];
	    ++idx;
	}
	clipJSON.duration = posKfJSON.times[idx-1] + 1;
	clip = THREE.AnimationClip.parse(clipJSON);
    },
    function(xhr) {},
    function(err) {console.error( err );}
);


init();
animate();


function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    camera.position.z = 25;
    controls = new THREE.TrackballControls(camera);

    // scene

    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
    scene.add( ambientLight );

    var pointLight = new THREE.PointLight( 0xffffff, 0.8 );
    camera.add( pointLight );
    scene.add( camera );


    var loader = new THREE.STLLoader( );

    loader.load( 'models/R_foot.stl', function ( geometry ) {

	var material = new THREE.MeshPhongMaterial( { color: 0xff5533, specular: 0x111111, shininess: 200 } );
        var mesh = new THREE.Mesh( geometry, material );

	scene.add( mesh );


	mixer = new THREE.AnimationMixer(mesh);
	var action = mixer.clipAction(clip);
	action.play();
    } );

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

//

function animate() {

    requestAnimationFrame( animate );

    if ( mixer ) mixer.update(0.01);
    
    render();

}

function render() {

    controls.update();
    renderer.render( scene, camera );

}

