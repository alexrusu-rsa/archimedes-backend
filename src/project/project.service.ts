import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { Any, DeleteResult, Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
  ) {}

  projectsToReturn: Project[] = [];
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

  async addProject(project: Project): Promise<Project> {
    try {
      const newProjectId = (await this.projectRepository.insert(project))
        .identifiers[0]?.id;
      if (newProjectId)
        return await this.projectRepository.findOneBy({ id: newProjectId });
      throw new HttpException(
        'Project insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteProject(id: string): Promise<DeleteResult> {
    try {
      const projectToDelete = await this.projectRepository.findOneBy({ id });
      if (projectToDelete) {
        const deletionResult = this.projectRepository.delete(id);
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
      const toUpdateProject = await this.projectRepository.findOneBy({ id });
      if (toUpdateProject) {
        const updatedProject = await this.projectRepository.update(id, project);
        if (updatedProject) return this.projectRepository.findOneBy({ id });
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

  async getProjectsUser(userId: string): Promise<Project[]> {
    try {
      const foundRatesForUser = await this.rateRepository.findBy({
        employeeId: userId,
      });
      if (foundRatesForUser) {
        (await foundRatesForUser).forEach(async (rate: Rate) => {
          const foundProjectOfRate = await this.projectRepository.findOneBy({
            id: rate.projectId,
          });
          this.projectsToReturn.push(foundProjectOfRate);
        });
        const projects = this.projectsToReturn;
        this.projectsToReturn = [];
        return projects;
      }
      throw new HttpException(
        'We could not find any rates for this user.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
