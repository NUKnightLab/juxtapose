cactus-project-template
=======================

Basis for creating new Knight Lab-themed documentation or static sites. To use:

Install Cactus
--------------
If you haven't, create a virtual environment for doing cactus projects. While we don't have a lot of experience, it seems you could get away with a single environment for all cactus-based sites. 

NOTE: the changes which allow Cactus to use KnightLab-specific templates have not yet been merged into the original Cactus project, so you must use the special pip install command below.

    mkvirtualenv cactussites
    pip install -e git://github.com/JoeGermuska/Cactus.git@skeleton#egg=cactus

You're now ready. See below for guidance on starting a new site.


Start a new site
----------------
In a terminal:

    workon cactussites
    cd ~/src (or whereever you keep your git repositories)
    cactus create **newsite.knightlab.com** --skeleton=https://github.com/NUKnightLab/cactus-project-template/archive/master.zip
    cd newsite.knightlab.com
    cactus serve
    
You're now looking at your site. Have fun!

Add your new site to GitHub
---------------------------
First, create the git repository where the site will live.
* Go to https://github.com/new
* Choose "NUKnightLab" from the "owner" menu
* For the repository name, use the fully-qualified domain name of the site (e.g. newsite.knightlab.com)
* Check "Public"
* Uncheck "Initialize this repository with a README"

In a terminal:

    cd ~/src/newsite.knightlab.com
    git add *
    git commit -m "initial"
    git remote add origin git@github.com:NUKnightLab/**newsite.knightlab.com**.git
    git push -u origin master

Deploying the site to S3
------------------------
Cactus makes this dead simple. The first time you do it, it will ask for the Amazon access key and secret key. You can find these values in [the Access Credentials section of our AWS console](https://portal.aws.amazon.com/gp/aws/securityCredentials?#access_credentials).

    $ cactus deploy
    Plugins: version
    Building error.html
    Building index.html
    Building robots.txt
    Building sitemap.xml
    Amazon access key (http://bit.ly/Agl7A9): 
    Amazon secret access key (will be saved in keychain): 
    S3 bucket name (www.yoursite.com): **newsite.knightlab.com**
    Bucket does not exist, create it? (y/n): y
    Bucket newsite.knightlab.com was selected with website endpoint newsite.knightlab.com.s3-website-us-east-1.amazonaws.com
    You can learn more about s3 (like pointing to your own domain) here: https://github.com/koenbok/Cactus
    Uploading site to bucket newsite.knightlab.com

If this is the first time you are deploying the site, you will also need to set up a DNS CNAME to make the public domain name map to the Amazon S3 bucket.

