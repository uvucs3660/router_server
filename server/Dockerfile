FROM node:lts-bookworm

# Install necessary packages
RUN apt-get update && \
    apt-get install -y openssh-server systemd systemd-sysv && \
    mkdir /var/run/sshd && \
    mkdir -p /etc/systemd/system/sshd.service.d && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create a user (e.g., user) and set up passwordless sudo
RUN useradd -m -d /home/user -s /bin/bash user && \
    echo "user ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Copy the SSH public key for the user
COPY .ssh/id_rsa.pub /home/user/.ssh/authorized_keys

# Set permissions for the SSH directory and keys
RUN chown -R user:user /home/user/.ssh && \
    chmod 700 /home/user/.ssh && \
    chmod 600 /home/user/.ssh/authorized_keys

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8080
# Expose the SSH port
EXPOSE 22

# Start the SSH service
# RUN systemctl enable sshd

CMD [ "npm", "run", "start" ]
