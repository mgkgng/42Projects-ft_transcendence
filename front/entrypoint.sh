#!/bin/sh

# find . -name "*.svelte" -exec sed -i "s/localhost/$HOST_HOSTNAME/g" {} \;
# find . -name "*.ts" -exec sed -i "s/localhost/$HOST_HOSTNAME/g" {} \;
#npm run preview 
npm run dev
