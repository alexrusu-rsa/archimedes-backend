import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Project } from 'src/entity/project.entity';
import { DeleteResult, InsertResult, Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
  ) {}

  async getProjects(): Promise<Project[]> {
    try {
      const projects = this.projectRepository.find();
      if (projects) return projects;
      throw new HttpException(
        'We could not find the projects!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async addProject(project: Project): Promise<InsertResult> {
    try {
      const insertionResult = this.projectRepository.insert(project);
      if (insertionResult) return insertionResult;
      throw new HttpException(
        'Project insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteProject(projectId: string): Promise<DeleteResult> {
    try {
      const projectToDelete = await this.projectRepository.findOne(projectId);
      if (projectToDelete) {
        const deletionResult = this.projectRepository.delete(projectId);
        if (deletionResult) {
          return deletionResult;
        }
        throw new HttpException(
          'Project was not deleted!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Project could not be found!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async updateProjectById(id: string, project: Project): Promise<Project> {
    try {
      const toUpdateProject = await this.projectRepository.findOne(id);
      if (toUpdateProject) {
        const updatedProject = await this.projectRepository.update(id, project);
        if (updatedProject) return this.projectRepository.findOne(id);
        throw new HttpException(
          'We could not update the project!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The project you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
