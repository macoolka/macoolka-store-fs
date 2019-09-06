/**
 * Macoolka Store Instance about file system.
 * @desczh
 * 本地文件系统的MacoolkaStore实例
 * @file
 */
import { pipe } from 'fp-ts/lib/pipeable';
import * as TE from 'fp-ts/lib/TaskEither'
import * as A from 'fp-ts/lib/Array'
import * as path from 'path'
import * as FS from 'macoolka-fs'
import {
    showFile, MonadFileStore, Container,
    containerToPath, monadFileStore, containerNotExist
} from 'macoolka-store-core'
import { pick } from 'macoolka-object'
import * as MF from 'macoolka-app/lib/MonadFunction'
import * as MN from 'macoolka-app/lib/MonadNode'
import * as R from 'fp-ts/lib/Reader'

const fileToPath = (root: string) => pipe(
    showFile.show,
    R.map(a => FS.foldPath([root, a]))
)
export {
    showFile
}
const createFileEff = MF.fromReaderTask(FS.createFileTask)
const deleteFileEff = MF.fromReader(FS.deleteFile)
const clearFolderEff = MF.fromReader(FS.clearFolder)
const fileEff = MF.fromReader(FS.file)
const fileStreamEff = MF.fromReader(FS.fileStream)
const existFileEff = MF.fromReader(FS.existFile)
const updateFileEff = MF.fromReaderTask(FS.updateFileTask)
const createFolderEff = MF.fromReader(FS.createFolder)
const updateFolderEff = MF.fromReader(FS.updateFolder)
const existFolderEff = MF.fromReader(FS.existFolder)
const foldersEff = MF.fromReader(FS.folders)
const globEff = MF.fromReader(FS.glob)
const createContainer = (root: string): MonadFileStore['createContainer'] => (a) => {
    return pipe(
        createFolderEff(containerToPath(root)(a)),
        MN.map(_ => a)
    )
}
const updateContainer = (root: string): MonadFileStore['updateContainer'] => (a) => {
    return pipe(
        updateFolderEff({ name: containerToPath(root)(a.data), where: containerToPath(root)(a.where) }),
        MN.map(_ => a.data)
    )
}
const existContainer = (root: string): MonadFileStore['existContainer'] => (a) => {
    return existFolderEff(containerToPath(root)(a))
}
const deleteContainer = (root: string): MonadFileStore['deleteContainer'] => (a) => {
    return pipe(
        existContainer(root)(a),
        MN.chain(result => result
            ? clearFolderEff(containerToPath(root)(a))
            : TE.left(containerNotExist(`${a.name}(${root})`))
        )
    )
}
const containers = (root: string): MonadFileStore['containers'] => () => {
    return pipe(
        foldersEff(root),
        TE.map(a => a.folders.map(name => ({ name })))
    )
}

const clearFolder = (root: string): MonadFileStore['clearFolder'] => (a) => {
    return pipe(
        clearFolderEff(fileToPath(root)({ ...a, name: '' })),
    )
}

const folders = (root: string): MonadFileStore['folders'] => (a) => {
    return pipe(
        foldersEff(fileToPath(root)({ ...a })),
        TE.chain(result => pipe(
            result.files,
            A.map(filename => {
                return file(root)({ container: a.container, folders: a.folders, name: filename })
            }),
            MN.parallel,
            TE.map(a => ({
                folders: result.folders,
                files: a
            }))
        ))

    )
}
const container = (root: string): MonadFileStore['container'] => a => {
    return pipe(
        existContainer(root)(a),
        TE.chain(result =>
            result
                ? TE.right(a as Container)
                : TE.left(containerNotExist(`${a.name}(${root})`))
        )
    )
}
const createFile = (root: string): MonadFileStore['createFile'] => (a) => {
    return pipe(
        createFileEff({ path: fileToPath(root)(a), data: a.data, encoding: a.encoding }),
        MN.chain(_ => file(root)(a))
    )

}
const file = (root: string): MonadFileStore['file'] => (a) => {
    return pipe(
        fileEff(fileToPath(root)(a)),
        TE.map(info => ({
            ...pick(a, ['name', 'container', 'folders']),
            size: info.size,
            lastModified: info.lastModified.toISOString()
        }))
    )
}
const existFile = (root: string): MonadFileStore['existFile'] => (a) => {
    return existFileEff(fileToPath(root)(a))
}
const updateFile = (root: string): MonadFileStore['updateFile'] => (a) => {
    return pipe(
        updateFileEff({
            data: {
                path: fileToPath(root)(a.data),
                encoding: a.data.encoding,
                data: a.data.data
            },
            where: fileToPath(root)(a.where)
        }),
        MN.chain(_ => file(root)(a.where))
    )

}

const glob = (root: string): MonadFileStore['glob'] => (a) => {
    // const root = path.join(a.container ? a.container : '', (a.folders ? a.folders : []).join(path.delimiter))
    return pipe(
        globEff({ path: a.pattern, options: { cwd: fileToPath(root)(a) } }),
        MN.map(values =>
            values.map(path.parse).map(
                value => ({
                    container: a.container,
                    folders: (a.folders ? a.folders : []).concat(value.dir.split(path.sep)),
                    name: value.base
                }))
        ),
        MN.chain(a => pipe(
            a,
            A.map(file(root)),
            A.array.sequence(MN.taskEither)
        ))
    )
}
//const files = (root: string): MonadFileStore['files'] => () => {
//    return pipe(
//        glob(root)({ container: '', pattern: ["**/*"] }),
//    )
//}
const deleteFile = (root: string): MonadFileStore['deleteFile'] => (a) => {
    return deleteFileEff(fileToPath(root)(a))
}
const fileStream = (root: string): MonadFileStore['fileStream'] => (a) => {
    return fileStreamEff(fileToPath(root)(a))
}

/**
 * build a MonadFileStore with a root path
 * @desczh
 * 从一个根路径建立MonadFileStore
 * @example
 * import * as path from 'path';
 * import buildStore from 'macoolka-store-local'
 * const store = buildStore(path.join(__dirname, 'fixtures', 'tests'))
 * @since 0.2.0
 * 
 */
export const buildStore = (root: string): MonadFileStore & { root: string } => ({
    root,
    ...monadFileStore({
        createContainer: createContainer(root),
        updateContainer: updateContainer(root),
        deleteContainer: deleteContainer(root),
        container: container(root),
        containers: containers(root),
        existContainer: existContainer(root),
        clearFolder: clearFolder(root),
        createFile: createFile(root),
        deleteFile: deleteFile(root),
        updateFile: updateFile(root),
        file: file(root),
        fileStream: fileStream(root),
        glob: glob(root),
        existFile: existFile(root),
        folders: folders(root),
    })
})

export default buildStore
