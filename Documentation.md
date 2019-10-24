After you’ve created your EC2 instance, below are the necessary steps before you can run npm install on AWS Linux:

Install updates (sudo yum update -y)

Install nvm (curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.0/install.sh | bash)

Install node (nvm install 8.10)

Install python 2.7, follow this link (https://myopswork.com/install-python-2-7-10-on-centos-rhel-75f90c5239a5)

Install node-gyp globally (npm install -g node-gyp)

Install development tools (sudo yum groupinstall "Development Tools"). This is needed by scrypt to compile properly.

Install up command. First need to give permission to /user/local/bin (sudo chown -R $(whoami) /usr/local/bin/). 

Then, install up using the script (sudo curl -sf https://up.apex.sh/install | sh). 

Afterwards, use the same AWS IAM you’ve created before then setup your AWS credentials.

Upload all your source files that we created above. 

Note: I recommend to commit and push your source files via Git then download to your newly created EC2 instance.
(Optional) Install git (sudo yum install git). This is needed if you save your repositories via Git (Github, Bitbucket, etc) and you want to clone or download your source codes.
Then, run the npm install from that newly created EC2 instance and run the up command again.

Afterwards, test using Postman or other API endpoint testing tool.
