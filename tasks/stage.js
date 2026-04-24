const prompt = require('prompt'),
    simpleGit = require('simple-git'),
    fs = require('node:fs'),
    path = require('path'),
    AdmZip = require('adm-zip')

const CDN_ROOT = '../cdn.knightlab.com', // maybe parameterize later
    PROJECT_NAME = 'juxtapose'; // can we read this from package.json?

function makeCDNPath(version) {
    return path.normalize(path.join(CDN_ROOT, 'app/libs', PROJECT_NAME, version));
}

function stageToCDN(version, latest) {
    var banner_version = (version == 'dev') ? new Date().toISOString() : version;


    if (fs.existsSync(CDN_ROOT)) {
        var dest = makeCDNPath(version);
        var zip = new AdmZip();
        zip.addLocalFolder('dist', PROJECT_NAME);
        zip.writeZip(path.join('dist', PROJECT_NAME + ".zip"));
        fs.cpSync('dist', dest, { recursive: true });
        console.log('copied to ' + dest);

        if (latest) {
            var latest_dir = makeCDNPath('latest');
            fs.rmSync(latest_dir, { recursive: true, force: true });
            fs.cpSync(dest, latest_dir, { recursive: true });
            console.log('copied version ' + version + ' to latest');
        }

    } else {
        console.error("CDN directory " + CDN_ROOT + "does not exist; nothing was copied")
    }
}

if (process.argv[2] == 'dev') {
    stageToCDN('dev')
} else {
    // if not 'dev' then ask for a new tag, update package.json, and tag the git repository
    simpleGit().tags(function(_, tagList) {
        if (tagList.latest) {
            console.log("The last tag used was " + tagList.latest);
        } else {
            console.log("No tagged versions yet.")
        }
        prompt.start();

        var properties = [{
            name: 'version',
            validator: /^\d+\.\d+\.\d+$/,
            message: "Enter the new version/tag",
            warning: "Tags must be three numbers separated by dots, and not have been used before.",
            conform: function(value) {
                return tagList && tagList.all && tagList.all.indexOf(value) == -1;
            }
        }];

        prompt.get(properties, function(err, result) {
            if (err) { return onErr(err); }
            var package_json = require('../package.json');
            if (package_json.version != result.version) {
                package_json.version = result.version;
                fs.writeFileSync('package.json', JSON.stringify(package_json, null, 4));
                simpleGit().commit(`Update to ${result.version}`, ['package.json'])
            }
            simpleGit().addTag(result.version)
                .pushTags('origin', function() {
                    console.log('  Tagged with: ' + result.version);
                    var latest = ("latest" == process.argv[2]); // maybe later use a CLI arg parser
                    stageToCDN(result.version, latest);
                });
        })
    })
}

function onErr(err) {
    console.error(err);
    return 1;
}
