#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import sys
from datetime import datetime


FOLDER_NAME = 'deployment'

print('Use this command to create a new archive to upload on hosting server')

prompt = input('Are you sure you want to deploy a new version of equinox (y/n)? ')

if prompt != 'y':
    print('Stopping deployment')
    sys.exit()


print('Starting deployment...')


# create deployment if non existant
if not os.path.exists(f'./{FOLDER_NAME}'):
    os.makedirs(f'./{FOLDER_NAME}')
    print(f'Created ./{FOLDER_NAME} folder...')

# create backup folder
now = datetime.now()
subfolder = f"d-{now.strftime('%Y%m%d-%H%M')}"
backup_folder = f"./{FOLDER_NAME}/{subfolder}"

if os.path.exists(backup_folder):
    print(f"Backup ./{FOLDER_NAME}/{backup_folder} already exists. Exiting")
    sys.exit()

os.makedirs(backup_folder)

# copy files and folders for backup
os.system(f'cp .env {backup_folder}')
os.system(f'cp ./dist/config.json {backup_folder}')
os.system(f'cp ./dist/package.json {backup_folder}')
os.system(f'cp -r ./dist/src {backup_folder}')
os.system(f'cp -r ./node_modules {backup_folder}') # online host does not do npm i properly


os.system(f'zip -r {subfolder}.zip {backup_folder} 1> /dev/null')
os.system(f'mv {subfolder}.zip ./{FOLDER_NAME}')

print('Finished creating backup!')
