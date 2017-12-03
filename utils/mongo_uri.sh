#!/bin/bash

export MONGO_USER=247admin
export MONGO_PASS=247adminpass
export MONGO_DB=247production
export MONGODB_URI="mongodb://$MONGO_USER:$MONGO_PASS@localhost/$MONGO_DB"