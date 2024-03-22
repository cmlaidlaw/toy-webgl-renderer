![Toy WebGL Renderer Screenshot](https://raw.githubusercontent.com/cmlaidlaw/toy-webgl-renderer/main/screenshot.png)

# Toy WebGL Renderer (2014)

## Development

I worked on this in the spring of 2014. In 2024 I dug it out of my archive and set it up with source control for uploading to GitHub. There is a fair amount of shader code which I adapted from tutorials and the work of other people who are way better at this than I am, but I don't seem to have left a lot of comments about which resources I used.

### Key Features
The current version demonstrates a forward renderer supporting two key features:
- Multiple shadow-casting (potentially dynamic) point and/or spot lights
- Self-shadowing on models

Both of which features you can see in the screenshot above. I recall also starting to work on a deferred renderer (as was the fashion at the time!) but stopped when I got my first job as a software engineer and no longer had bandwidth to think about code outside of work.

## Running

WebGL is (typically?) not accessible when HTML documents are loaded as local files, so you will need to run a local HTTP server in order to run the program. The easiest way to do that is probably by running the following command in the root of this repo and then visiting http://localhost:8000/index.html.

    python3 -m http.server

### Compatability

Firefox does not seem to support one of the extensions I used (GL_EXT_draw_buffers), so you will need to use a different browser. I originally built this using Chrome, and tested it using Safari when putting this repo together, so it is likely that any Chromium-derived browser will work ok.

## Fun (?) Facts

I wrote this before I had ever worked as a professional software engineer! I learned some valuable lessons on this project. It is also pretty idiosyncratic, and not necessarily how I would approach this challenge today. I am a little surprised that it still works.

You may notice that there are no tests. That is because I didn't really know what a unit test was or how to write one back then. This knowledge would have been pretty helpful! I have a fun story about a subtle array indexing issue in the 3x3 matrix transpose function related to this point.

I also didn't know how to use source control at the time, so the git history on this repo will show March 2024.
