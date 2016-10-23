
import os, subprocess, argparse, zipfile, shutil, io
import boto3

def getDirectoriesFromArguments():
    """
    Gets the list of directories to package up from the command line
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--directories',
                        help='Directories whose contents will be zipped up',
                        required=False)
    args = parser.parse_args()
    dirs = args.directories
    if not dirs:
        files = os.listdir(".")
        return filter(os.path.isdir, files)
    else:
        return dirs.split(',')

def files_to_zip(path):
    for root, dirs, files in os.walk(path):
        for f in files:
            full_path = os.path.join(root, f)
            archive_name = full_path[len(path) + len(os.sep):]
            yield full_path, archive_name

def makeZipFileBytes(directoryName):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w') as z:
        path = os.path.join("node_modules", directoryName)
        for full_path, archive_name in files_to_zip(path=path):
            z.write(full_path, archive_name)
    return buf.getvalue()

def updateLambda(directoryName):
    aws_lambda = boto3.client('lambda')
    aws_lambda.update_function_code(
        FunctionName="luath-%s" % directoryName,
        ZipFile=makeZipFileBytes(directoryName),
        Publish=True
    )

if __name__ == "__main__":
    dirs = getDirectoriesFromArguments()
    try:
        for directoryName in dirs:
            print "Packaging up %s" % directoryName
            args = ["npm", "install", directoryName]
            returncode = subprocess.call(args)
            if returncode != 0:
                print "An error occurred: %s" % err
                exit(1)
            print "Updating Lambda function..."
            updateLambda(directoryName)

    finally:
        shutil.rmtree("node_modules")
        print "Done"
