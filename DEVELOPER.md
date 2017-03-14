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

#### `fab stage` to create a version number:

To stage your changes to a versioned directory in your local CDN repository, type `fab stage` This runs a build, copies the files into a versioned directory in your local `cdn.knightlab.com` repository, and tags the last commit with a version number.

#### `fab stage_dev` to copy current code to CDN dev path:

To stage your changes to the `dev` directory in your local CDN repository, type `fab stage_dev` This copies files from a versioned directory in your local `cdn.knightlab.com` respository into the corresponding `dev` directory.

#### `fab stage_latest` to copy current code to CDN latest path:

To stage your changes to the `latest` directory in your local CDN repository, type `fab stage_latest` This copies files from a versioned directory in your local `cdn.knightlab.com` respository into the corresponding `latest` directory.

#### Deploy to CDN

Commit copied changes within the `cdn.knightlab.com` repo and run `fab deploy`


## Deploying the website

The website deployment is managed by git-deploy:

`git deploy stg`
`git deploy prd`

Note that env var configs in git deploy set the CDN paths for these respective deployments. Staging (juxtapose.knilab.com) uses the current dev version of the CDN. Production (juxtapose.knightlab.com) uses the latest version of the CDN
