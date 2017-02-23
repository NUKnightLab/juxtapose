## Requirements

 python 2.7.x

 [virtualenvwrapper](http://virtualenvwrapper.readthedocs.org/)

 [Node.js](http://nodejs.org)

 [LESS](http://lesscss.org)

    # npm install -g less

 [UglifyJS](https://github.com/mishoo/UglifyJS)

    # npm install -g uglify-js@1

## Setup

    # Change into the parent directory containing your repositories
    cd path_to_repos_root

    # Clone the secrets repository (if need deployment credentials; it's a private Knight Lab repo)
    git clone git@github.com:NUKnightLab/secrets.git

    # Clone the cdn repository (if necessary)
    git clone git@github.com:NUKnightLab/cdn.knightlab.com.git

    # Clone the timeline repository
    git clone git@github.com:NUKnightLab/juxtapose.git

    # Change into the juxtapose repository
    cd juxtapose

    # Create a virtual environment
    mkvirtualenv juxtapose

    # Activate the virtual environment
    workon juxtapose

    # Install python requirements
    pip install -r requirements.txt

    # Run the development server
    fab serve


## Overview

Files in the inner `juxtapose` directory are resources for deployment to the CDN.

Files in the `website` directory are specific to the website.

`config.json` is used to control building, staging, and deployment

If you're making changes to anything that eventually ends up in the `build` directory (e.g. anything in the `juxtapose` directory), it is recommended that you run a simple HTTP server in a separate window to serve up those files, because otherwise the website won't have access to them. To do this, `cd` into the root directory of the project and run `python -m SimpleHTTPServer`. You will also have to change your `env.sh` file to have `export CDN_URL="http://localhost:<port number>/build/"` and run `source env.sh` in order to save your changes.


## Deploying to the CDN

To stage your changes to a versioned directory in your local CDN repository, type `fab stage` This runs a build, copies the files into a versioned directory in your local `cdn.knightlab.com` repository, and tags the last commit with a version number.

To stage your changes to the `latest` directory in your local CDN repository, type `fab stage_latest` This copies files from a versioned directory in your local `cdn.knightlab.com` respository into the corresponding `latest` directory.

You must push and deploy all CDN changes separately from that repository.


## Deploying to S3 (timeline.knightlab.com)

To deploy to S3, type `fab stg deploy` or `fab prd deploy` depending on whether you want to deploy it to the production or testing server.
