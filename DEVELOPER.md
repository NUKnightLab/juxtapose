## Requirements

 python 2.7.x

 [virtualenvwrapper](https://virtualenvwrapper.readthedocs.org/)

 [Node.js](https://nodejs.org)

 [LESS](https://lesscss.org)

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

    # copy env.sh.example to env.sh, edit it for your environment

## Running for development

    # source env.sh
    . env.sh

    # Run the development server
    fab serve


## Overview

Files in the inner `juxtapose` directory are resources for deployment to the CDN.

Files in the `website` directory are specific to the website.

`config.json` is used to control building, staging, and deployment


## Deploying Juxtapose to the KnightLab CDN

## Deploying changes to the JavaScript

Before beginning to deploy, make sure all changes are thoroughly tested. Update package.json to the new version number.

Deploying the JavaScript library uses `npm` scripts defined in `package.json`. To deploy to the Knight Lab CDN, use the following scripts:

* npm run stage_latest (most common)
* npm run stage
* npm run stage_dev

To stage a new release of JuxtaposeJS, use `npm run stage_latest`. This will ask you for a version number (tag), which should match what's in `package.json`.  It will also build the ZIP archive, and copy the distribution to the appropriate versioned subdirectory of the `cdn.knightlab.com` repository, as well as copying it to the `/latest/` directory.  In the rare case when you want to tag a version, but not change `latest`, use `npm run stage` although then copying that to `/latest/` is outside the scope of these tools. 

#### Deploy to CDN

Commit copied changes within the `cdn.knightlab.com` repo and run `./deploy.sh`


## Deploying the website

The website deployment is managed by git-deploy:

`git deploy stg`
`git deploy prd`

Note that env var configs in git deploy set the CDN paths for these respective deployments. Staging (juxtapose.knilab.com) uses the current dev version of the CDN. Production (juxtapose.knightlab.com) uses the latest version of the CDN
