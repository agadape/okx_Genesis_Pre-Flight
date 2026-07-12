#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 22
openclaw plugins install @okxweb3/a2a-openclaw
openclaw setup --force
openclaw gateway run --force --allow-unconfigured
