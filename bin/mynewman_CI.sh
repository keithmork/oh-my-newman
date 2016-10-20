#!/bin/bash

# @Author: mojinrong
# @Date:   2016-09-23 13:41:39
# @Last Modified by:   mojinrong
# @Last Modified time: 2016-10-14 13:30:09

readonly HOME="/data/testing/AutoTest/newman_test"
readonly COLLECTION_BASEDIR="$HOME/data/collections"
readonly mynewman="$(dirname $0)/mynewman.js"

# eg. dev | smoke | test | pre ...
readonly ENV="$1"
readonly COLLECTION_FILE="$2"
# sub-directory name under $COLLECTION_BASEDIR
readonly COLLECTION_SUBDIR="$3"

readonly JENKINS_HOME="/root/.jenkins"
readonly JENKINS_URL="192.168.3.201/jenkins"
readonly JOB="AutoTest_API_smoke"
readonly JOB_HOMEPAGE="${JENKINS_URL}/view/AutoTest/job/${JOB}/"
readonly WORKSPACE="${JENKINS_HOME}/jobs/${JOB}/workspace"
readonly TOKEN="dachen"

RUN_COUNT=0
FAILED_COUNT=0

if [[ "$#" -lt 2 ]] || [[ -z "${COLLECTION_FILE}" ]]; then
  echo "Usage: $0 ENV COLLECTION_FILE [COLLECTION_SUBDIR]"
  exit 1
fi

if [[ ! -f "${mynewman}" ]]; then
  err "[ERROR] Cannot find '${mynewman}'. Exiting..."
  exit 1
fi

# Functions

function err() {
  echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@" >&2
}

function run_mynewman() {
  collection_dir=$1
  collection_file=$2
  env_file=$3

  if [[ -d "${collection_dir}" ]]; then # dir exists
    file="$(ls -l "${collection_dir}" | grep "${collection_file}")"

    if [[ -n "${file}" ]]; then # file exists
      RUN_COUNT=$((${RUN_COUNT} + 1))

      node "${mynewman}" \
        -c "${collection_dir}/${collection_file}" \
        -e "${env_file}"

      if [[ "$?" -ne 0 ]]; then
        FAILED_COUNT=$((${FAILED_COUNT} + 1))
      fi
    else
      err "[WARNING] Cannot find collection file '${collection_file}'' in '${collection_dir}/'"
    fi
  else
    err "[WARNING] Cannot find directory '${collection_dir}/'"
  fi
}


# Update test cases

cd "${HOME}"
git pull


# Clean

rm -rf "${HOME}/output"


# Run tests

cd "${HOME}/bin"

# 针对单个接口，不同参数组合，包括非法参数等
run_mynewman "${COLLECTION_BASEDIR}/cli" "${COLLECTION_FILE}" "${ENV}"

# 针对接口之间有关联的场景
run_mynewman "${COLLECTION_BASEDIR}/${COLLECTION_SUBDIR}" "${COLLECTION_FILE}" "${ENV}"

if [[ "${RUN_COUNT}" -eq 0 ]]; then
  echo ""
  echo "All tests are skipped."
  exit 0
fi


# Backup

if [[ ! -d "${WORKSPACE}" ]]; then
  mkdir -p "${WORKSPACE}"
fi
cp -R "${HOME}/output" "${WORKSPACE}"


# Report

echo "[INFO] Calling Jenkins job to send email, backup etc..."

# this API requires "Build Authorization Token Root Plugin"
curl -s -X POST "${JENKINS_URL}/buildByToken/buildWithParameters?job=${JOB}&token=${TOKEN}&env=${ENV}&projectName=${COLLECTION_FILE}&failureCount=${FAILED_COUNT}"

if [[ "${FAILED_COUNT}" -gt 0 ]]; then
  echo ""
  err "[ERROR] One or more tests failed!"
  echo "Reports and logs: ${JOB_HOMEPAGE}"
  exit 1
else
  echo ""
  echo "All tests passed!"
  echo "Reports and logs: ${JOB_HOMEPAGE}"
fi
